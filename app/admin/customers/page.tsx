'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

const initialCustomers = [
  { id: 'CUST-1', name: '홍길동', phone: '010-1234-5678', email: 'hong@example.com', joinDate: '2024-01-01', lastLogin: '2024-07-01', status: 'active' },
  { id: 'CUST-2', name: '김영희', phone: '010-2345-6789', email: 'kim@example.com', joinDate: '2024-02-10', lastLogin: '2024-07-02', status: 'active' },
  { id: 'CUST-3', name: '박철수', phone: '010-3456-7890', email: 'park@example.com', joinDate: '2024-03-15', lastLogin: '2024-07-03', status: 'inactive' },
  { id: 'CUST-4', name: '이민정', phone: '010-4567-8901', email: 'lee@example.com', joinDate: '2024-04-20', lastLogin: '2024-07-04', status: 'active' },
];

export default function CustomersPage() {
  const [customers, setCustomers] = useState(initialCustomers);
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [form, setForm] = useState({ name: '', phone: '', email: '', status: 'active' });
  const [search, setSearch] = useState('');

  // 새 회원 추가
  const handleAdd = () => {
    setForm({ name: '', phone: '', email: '', status: 'active' });
    setShowAdd(true);
  };
  const handleAddSave = () => {
    if (!form.name.trim() || !form.phone.trim() || !form.email.trim()) {
      toast.error('모든 항목을 입력해주세요.');
      return;
    }
    if (!/^01[0-9]-\d{3,4}-\d{4}$/.test(form.phone)) {
      toast.error('연락처 형식이 올바르지 않습니다. (예: 010-1234-5678)');
      return;
    }
    if (!/^[\w.-]+@[\w.-]+\.\w+$/.test(form.email)) {
      toast.error('이메일 형식이 올바르지 않습니다.');
      return;
    }
    setCustomers([
      ...customers,
      {
        id: `CUST-${Date.now()}`,
        name: form.name,
        phone: form.phone,
        email: form.email,
        joinDate: new Date().toISOString().slice(0, 10),
        lastLogin: new Date().toISOString().slice(0, 10),
        status: form.status,
      },
    ]);
    setShowAdd(false);
    toast.success('회원이 추가되었습니다.');
  };

  // 회원 정보 수정
  const handleEdit = (user) => {
    setEditUser(user);
    setForm({ name: user.name, phone: user.phone, email: user.email, status: user.status });
    setShowEdit(true);
  };
  const handleEditSave = () => {
    if (!form.name.trim() || !form.phone.trim() || !form.email.trim()) {
      toast.error('모든 항목을 입력해주세요.');
      return;
    }
    if (!/^01[0-9]-\d{3,4}-\d{4}$/.test(form.phone)) {
      toast.error('연락처 형식이 올바르지 않습니다. (예: 010-1234-5678)');
      return;
    }
    if (!/^[\w.-]+@[\w.-]+\.\w+$/.test(form.email)) {
      toast.error('이메일 형식이 올바르지 않습니다.');
      return;
    }
    setCustomers(
      customers.map((u) =>
        u.id === editUser.id ? { ...u, ...form } : u
      )
    );
    setShowEdit(false);
    toast.success('회원 정보가 수정되었습니다.');
  };

  // 회원 삭제
  const handleDelete = (user) => {
    if (window.confirm(`${user.name} 회원을 삭제하시겠습니까?`)) {
      setCustomers(customers.filter((u) => u.id !== user.id));
      toast.success('회원이 삭제되었습니다.');
    }
  };

  // 상태 토글
  const handleToggleStatus = (user) => {
    setCustomers(
      customers.map((u) =>
        u.id === user.id ? { ...u, status: u.status === 'active' ? 'inactive' : 'active' } : u
      )
    );
  };

  // 검색 필터링
  const filteredCustomers = customers.filter(user =>
    user.name.toLowerCase().includes(search.toLowerCase()) ||
    user.phone.includes(search) ||
    user.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">회원 관리</h1>
        <Button onClick={handleAdd}>새 회원 추가</Button>
      </div>
      <div className="mb-4 flex justify-end">
        <Input
          placeholder="이름, 연락처, 이메일로 검색"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-64"
        />
      </div>
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">이름</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">연락처</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">이메일</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">가입일</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">최근 로그인</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">상태</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">관리</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {filteredCustomers.map((user) => (
            <tr key={user.id}>
              <td className="px-6 py-4 whitespace-nowrap">{user.name}</td>
              <td className="px-6 py-4 whitespace-nowrap">{user.phone}</td>
              <td className="px-6 py-4 whitespace-nowrap">{user.email}</td>
              <td className="px-6 py-4 whitespace-nowrap">{user.joinDate}</td>
              <td className="px-6 py-4 whitespace-nowrap">{user.lastLogin}</td>
              <td className="px-6 py-4 whitespace-nowrap">
                <Button size="sm" variant={user.status === 'active' ? 'default' : 'outline'} onClick={() => handleToggleStatus(user)}>
                  {user.status === 'active' ? '활성' : '비활성'}
                </Button>
              </td>
              <td className="px-6 py-4 whitespace-nowrap space-x-2">
                <Button size="sm" variant="outline" onClick={() => handleEdit(user)}>수정</Button>
                <Button size="sm" variant="destructive" onClick={() => handleDelete(user)}>삭제</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* 새 회원 추가 다이얼로그 */}
      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>새 회원 추가</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input placeholder="이름" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            <Input placeholder="연락처 (010-0000-0000)" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
            <Input placeholder="이메일" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAdd(false)}>취소</Button>
            <Button onClick={handleAddSave}>저장</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 회원 정보 수정 다이얼로그 */}
      <Dialog open={showEdit} onOpenChange={setShowEdit}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>회원 정보 수정</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input placeholder="이름" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            <Input placeholder="연락처 (010-0000-0000)" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
            <Input placeholder="이메일" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEdit(false)}>취소</Button>
            <Button onClick={handleEditSave}>저장</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 