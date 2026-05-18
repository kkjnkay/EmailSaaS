import React, { useEffect, useState } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase';
import { startOfDay, endOfDay, format, eachDayOfInterval } from 'date-fns';
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import 'chartjs-adapter-date-fns';
import { Card, DatePicker, Space, Table, Typography } from 'antd';
import dayjs from 'dayjs';

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const { Title } = Typography;
const { RangePicker } = DatePicker;

function normalizeSubject(subject = '') {
  return subject
    .toLowerCase()
    .replace(/^(re|fwd):\s*/i, '')
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    .replace(/\s+/g, ' ')
    .replace(/[^\x00-\x7F]/g, '')
    .trim();
}

const AnalyticsPage = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [leads, setLeads] = useState([]);
  const [replies, setReplies] = useState([]);
  const [dateRange, setDateRange] = useState([
    dayjs().subtract(7, 'days'),
    dayjs(),
  ]);

  useEffect(() => {
    const fetchData = async () => {
      const [campaignSnap, leadSnap, replySnap] = await Promise.all([
        getDocs(collection(db, 'campaigns')),
        getDocs(collection(db, 'leads')),
        getDocs(collection(db, 'replies')),
      ]);

      const campaignsData = campaignSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const leadsData = leadSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const repliesData = replySnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      setCampaigns(campaignsData);
      setLeads(leadsData);
      setReplies(repliesData);
    };

    fetchData();
  }, []);

  const fromDate = startOfDay(dateRange[0].toDate());
  const toDate = endOfDay(dateRange[1].toDate());

  const allSubjects = campaigns.flatMap(c =>
    (c.sequences || []).map(s => normalizeSubject(s.subject || ''))
  );

  const days = eachDayOfInterval({ start: fromDate, end: toDate });
  const dayLabels = days.map(d => format(d, 'MMM d'));

  const messagesPerDay = days.map(day => {
    const start = startOfDay(day);
    const end = endOfDay(day);

    let count = 0;
    leads.forEach(lead => {
      (lead.messages || []).forEach(m => {
        if (m.sentAt?.toDate() >= start && m.sentAt?.toDate() <= end) {
          count++;
        }
      });
    });

    return count;
  });

  const totalSent = messagesPerDay.reduce((a, b) => a + b, 0);

  const filteredReplies = replies.filter(r => {
    const date = r.receivedAt?.toDate();
    const subjectNorm = normalizeSubject(r.subject);
    return (
      date >= fromDate &&
      date <= toDate &&
      allSubjects.includes(subjectNorm)
    );
  });

  const totalReplies = filteredReplies.length;

  const campaignStats = campaigns.map(c => {
    const campaignLeads = leads.filter(l => l.campaignId === c.id);
    let sent = 0;
    campaignLeads.forEach(l =>
      l.messages?.forEach(m => {
        const sentAt = m.sentAt?.toDate();
        if (sentAt >= fromDate && sentAt <= toDate) {
          sent++;
        }
      })
    );

    const subjects = (c.sequences || []).map(s => normalizeSubject(s.subject));
    const repliesCount = filteredReplies.filter(r =>
      subjects.includes(normalizeSubject(r.subject))
    ).length;

    return {
      key: c.id,
      name: c.name,
      sent,
      replies: repliesCount,
    };
  });

  const columns = [
    { title: 'Campaign', dataIndex: 'name', key: 'name' },
    { title: 'Sent', dataIndex: 'sent', key: 'sent' },
    { title: 'Replies', dataIndex: 'replies', key: 'replies' },
  ];

  return (
    <div style={{ padding: '2rem', width: '100%' }}>
      <Title level={2}>📊 Campaign Analytics</Title>

      <Space align="start" style={{ marginBottom: 24 }}>
        <RangePicker
          value={dateRange}
          onChange={setDateRange}
          allowClear={false}
          style={{ borderRadius: 6 }}
        />
        <Card size="small" style={{ background: '#fafafa' }}>
          <p><strong>Total Sent:</strong> {totalSent}</p>
          <p><strong>Total Replies:</strong> {totalReplies}</p>
        </Card>
      </Space>

      {/* 🔧 Графік тепер займає всю ширину */}
      <div style={{ width: '100%', height: 300 }}>
        <Bar
          data={{
            labels: dayLabels,
            datasets: [{
              label: 'Emails Sent',
              data: messagesPerDay,
              backgroundColor: '#1890ff',
              borderRadius: 4,
              barThickness: 28,
            }],
          }}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
              y: { beginAtZero: true, ticks: { stepSize: 1 } },
            },
          }}
        />
      </div>

      <div style={{ marginTop: 40 }}>
        <Title level={4}>Campaign Breakdown</Title>
        <Table
          dataSource={campaignStats}
          columns={columns}
          pagination={false}
          bordered
          style={{ marginTop: 16 }}
        />
      </div>
    </div>
  );
};

export default AnalyticsPage;
