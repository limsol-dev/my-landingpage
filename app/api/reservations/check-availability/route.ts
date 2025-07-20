import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { z } from 'zod'

interface Conflict {
  programId?: string
  reason: string
  message: string
  maxParticipants?: number
  requestedParticipants?: number
  availableStock?: number
  requestedQuantity?: number
}

interface ProgramAvailability {
  available: boolean
  conflicts: Conflict[]
  programDetails?: any[]
}

const checkAvailabilitySchema = z.object({
  roomId: z.string().optional(),
  roomType: z.string().optional(),
  checkInDate: z.string(),
  checkOutDate: z.string(),
  programIds: z.array(z.string()).optional(),
  adults: z.number().min(1),
  children: z.number().min(0),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = checkAvailabilitySchema.parse(body)
    
    const { roomId, roomType, checkInDate, checkOutDate, programIds, adults, children } = validatedData
    const totalGuests = adults + children

    // 1. 객실 가용성 확인
    const roomAvailability = await checkRoomAvailability({
      roomId,
      roomType,
      checkInDate,
      checkOutDate,
      totalGuests
    })

    if (!roomAvailability.available) {
      return NextResponse.json({
        success: false,
        available: false,
        reason: 'room_unavailable',
        message: roomAvailability.message
      })
    }

    // 2. 프로그램 가용성 확인 (선택된 경우)
    let programAvailability: ProgramAvailability = { available: true, conflicts: [], programDetails: [] }
    if (programIds && programIds.length > 0) {
      programAvailability = await checkProgramAvailability({
        programIds,
        checkInDate,
        checkOutDate,
        participants: totalGuests
      })
    }

    if (!programAvailability.available) {
      return NextResponse.json({
        success: false,
        available: false,
        reason: 'program_unavailable',
        message: '선택하신 프로그램의 재고가 부족합니다.',
        conflicts: programAvailability.conflicts
      })
    }

    // 3. 모든 조건이 만족되면 가용 확인
    return NextResponse.json({
      success: true,
      available: true,
      message: '예약 가능합니다.',
      details: {
        room: roomAvailability.roomDetails,
        programs: programAvailability.programDetails || []
      }
    })

  } catch (error) {
    console.error('가용성 확인 오류:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false, 
          available: false,
          error: '입력 데이터가 올바르지 않습니다.',
          details: error.errors
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { 
        success: false, 
        available: false,
        error: '가용성 확인 중 오류가 발생했습니다.' 
      },
      { status: 500 }
    )
  }
}

// 객실 가용성 확인 함수
async function checkRoomAvailability({
  roomId,
  roomType,
  checkInDate,
  checkOutDate,
  totalGuests
}: {
  roomId?: string
  roomType?: string
  checkInDate: string
  checkOutDate: string
  totalGuests: number
}) {
  try {
    // 객실 정보 조회
    let roomQuery = supabase.from('rooms').select('*')
    
    if (roomId) {
      roomQuery = roomQuery.eq('id', roomId)
    } else if (roomType) {
      roomQuery = roomQuery.eq('type', roomType)
    }
    
    const { data: rooms, error: roomError } = await roomQuery.eq('is_available', true)

    if (roomError || !rooms || rooms.length === 0) {
      return {
        available: false,
        message: '해당 객실을 찾을 수 없습니다.',
        roomDetails: null
      }
    }

    // 수용 인원 확인
    const suitableRooms = rooms.filter((room: any) => room.max_guests >= totalGuests)
    if (suitableRooms.length === 0) {
      return {
        available: false,
        message: `${totalGuests}명을 수용할 수 있는 객실이 없습니다.`,
        roomDetails: null
      }
    }

    // 예약 충돌 확인
    for (const room of suitableRooms) {
      const { data: conflictingReservations, error: reservationError } = await supabase
        .from('reservations')
        .select('*')
        .eq('room_id', room.id)
        .in('status', ['pending', 'confirmed'])
        .or(`and(check_in_date.lte.${checkOutDate},check_out_date.gte.${checkInDate})`)

      if (reservationError) {
        console.error('예약 충돌 확인 오류:', reservationError)
        continue
      }

      // 충돌이 없는 객실이 있으면 사용 가능
      if (!conflictingReservations || conflictingReservations.length === 0) {
        return {
          available: true,
          message: '예약 가능한 객실이 있습니다.',
          roomDetails: room
        }
      }
    }

    return {
      available: false,
      message: '해당 날짜에 예약 가능한 객실이 없습니다.',
      roomDetails: null
    }

  } catch (error) {
    console.error('객실 가용성 확인 오류:', error)
    return {
      available: false,
      message: '객실 가용성 확인 중 오류가 발생했습니다.',
      roomDetails: null
    }
  }
}

// 프로그램 가용성 확인 함수
async function checkProgramAvailability({
  programIds,
  checkInDate,
  checkOutDate,
  participants
}: {
  programIds: string[]
  checkInDate: string
  checkOutDate: string
  participants: number
}): Promise<ProgramAvailability> {
  try {
    const conflicts: Conflict[] = []
    const programDetails: any[] = []

    for (const programId of programIds) {
      // 프로그램 정보 조회
      const { data: program, error: programError } = await supabase
        .from('programs')
        .select('*')
        .eq('id', programId)
        .eq('is_available', true)
        .single()

      if (programError || !program) {
        conflicts.push({
          programId,
          reason: 'program_not_found',
          message: '프로그램을 찾을 수 없습니다.'
        })
        continue
      }

      // 최대 참가자 수 확인
      if (program.max_participants && participants > program.max_participants) {
        conflicts.push({
          programId,
          reason: 'exceeds_max_participants',
          message: `최대 참가자 수(${program.max_participants}명)를 초과했습니다.`,
          maxParticipants: program.max_participants,
          requestedParticipants: participants
        })
        continue
      }

      // 재고 확인
      if (program.stock_quantity !== null && program.stock_quantity > 0) {
        // 해당 기간의 기존 예약 확인
        const { data: existingReservations, error: reservationError } = await supabase
          .from('reservation_programs')
          .select('quantity')
          .eq('program_id', programId)
          .gte('scheduled_date', checkInDate)
          .lte('scheduled_date', checkOutDate)

        if (reservationError) {
          console.error('프로그램 예약 확인 오류:', reservationError)
          conflicts.push({
            programId,
            reason: 'check_error',
            message: '프로그램 재고 확인 중 오류가 발생했습니다.'
          })
          continue
        }

        const bookedQuantity = existingReservations?.reduce((sum: number, res: any) => sum + res.quantity, 0) || 0
        const availableStock = program.stock_quantity - bookedQuantity

        if (availableStock < 1) {
          conflicts.push({
            programId,
            reason: 'insufficient_stock',
            message: '프로그램의 재고가 부족합니다.',
            availableStock,
            requestedQuantity: 1
          })
          continue
        }
      }

      programDetails.push(program)
    }

    return {
      available: conflicts.length === 0,
      conflicts,
      programDetails
    }

  } catch (error) {
    console.error('프로그램 가용성 확인 오류:', error)
    return {
      available: false,
      conflicts: [{
        reason: 'system_error',
        message: '프로그램 가용성 확인 중 시스템 오류가 발생했습니다.'
      }],
      programDetails: []
    }
  }
} 