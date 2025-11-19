'use client';

import { useState } from 'react';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { GitCompare } from 'lucide-react';
import type { UserAgentData } from '@/types/analytics';

interface UserAgentSelectorProps {
  availableUserAgents: UserAgentData[];
  onCompare: (primaryAgent: string, groupOthers: boolean, limit: number) => void;
  loading?: boolean;
}

export function UserAgentSelector({ availableUserAgents, onCompare, loading }: UserAgentSelectorProps) {
  const [selectedAgent, setSelectedAgent] = useState<string>('');
  const [groupOthers, setGroupOthers] = useState(true);
  const [limit, setLimit] = useState(10);

  // Get unique user agents
  const uniqueUserAgents = Array.from(
    new Set(availableUserAgents.map(ua => ua.userAgent))
  ).sort();

  const handleCompare = () => {
    if (!selectedAgent) {
      alert('กรุณาเลือก User Agent ที่ต้องการเปรียบเทียบ');
      return;
    }
    onCompare(selectedAgent, groupOthers, limit);
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center gap-2 mb-4">
        <GitCompare className="h-5 w-5 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-900">เปรียบเทียบ User Agent</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* User Agent Selector */}
        <div>
          <Label htmlFor="primary-agent" className="mb-2 block">
            User Agent หลัก
          </Label>
          <Select value={selectedAgent} onValueChange={setSelectedAgent} disabled={loading}>
            <SelectTrigger id="primary-agent">
              <SelectValue placeholder="เลือก User Agent" />
            </SelectTrigger>
            <SelectContent>
              {uniqueUserAgents.length === 0 ? (
                <SelectItem value="none" disabled>ไม่มีข้อมูล</SelectItem>
              ) : (
                uniqueUserAgents.map((agent) => (
                  <SelectItem key={agent} value={agent}>
                    {agent.length > 40 ? `${agent.substring(0, 40)}...` : agent}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>

        {/* Group Others Toggle */}
        <div>
          <Label htmlFor="group-others" className="mb-2 block">
            การแสดงผล
          </Label>
          <Select 
            value={groupOthers ? 'grouped' : 'individual'} 
            onValueChange={(value) => setGroupOthers(value === 'grouped')}
            disabled={loading}
          >
            <SelectTrigger id="group-others">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="grouped">รวม User Agent อื่นๆ</SelectItem>
              <SelectItem value="individual">แสดงแยกรายตัว</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Limit Input */}
        {!groupOthers && (
          <div>
            <Label htmlFor="limit" className="mb-2 block">
              จำนวน User Agent ที่แสดง
            </Label>
            <Input
              id="limit"
              type="number"
              min="1"
              max="50"
              value={limit}
              onChange={(e) => setLimit(parseInt(e.target.value, 10) || 10)}
              disabled={loading}
            />
          </div>
        )}

        {/* Compare Button */}
        <div className="flex items-end">
          <Button 
            onClick={handleCompare} 
            disabled={loading || !selectedAgent}
            className="w-full"
          >
            <GitCompare className="h-4 w-4 mr-2" />
            {loading ? 'กำลังโหลด...' : 'เปรียบเทียบ'}
          </Button>
        </div>
      </div>
    </div>
  );
}

