"use client"

import { useState } from 'react'
import { programs, PensionProgram } from '@/data/programs'
import { ProgramModal } from './ProgramModal'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Image from 'next/image'

export function ProgramList() {
  const [selectedProgram, setSelectedProgram] = useState<PensionProgram | null>(null)

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {programs.map((program) => (
          <Card
            key={program.id}
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => setSelectedProgram(program)}
          >
            <div className="relative w-full h-[200px]">
              <Image
                src={program.imageUrl}
                alt={program.title}
                fill
                className="object-cover rounded-t-lg"
              />
              <Badge
                className="absolute top-2 right-2"
                variant={
                  program.type === 'premium'
                    ? 'default'
                    : program.type === 'special'
                    ? 'destructive'
                    : 'secondary'
                }
              >
                {program.type === 'premium'
                  ? '프리미엄'
                  : program.type === 'special'
                  ? '스페셜'
                  : '스탠다드'}
              </Badge>
            </div>

            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>{program.title}</span>
                <span className="text-lg font-normal">
                  {program.price.toLocaleString()}원
                </span>
              </CardTitle>
            </CardHeader>

            <CardContent>
              <p className="text-gray-600 mb-4">{program.description}</p>
              <div className="flex flex-wrap gap-2">
                {program.amenities.slice(0, 3).map((amenity) => (
                  <Badge key={amenity} variant="outline">
                    {amenity}
                  </Badge>
                ))}
                {program.amenities.length > 3 && (
                  <Badge variant="outline">+{program.amenities.length - 3}</Badge>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedProgram && (
        <ProgramModal
          program={selectedProgram}
          isOpen={true}
          onClose={() => setSelectedProgram(null)}
        />
      )}
    </div>
  )
} 