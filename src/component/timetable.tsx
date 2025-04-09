'use client';
import React, { useEffect, useState } from 'react';
import styles from './timetable.module.css';
import { UserProfile } from '@/lib/supabase';
interface TimetableProps {
  profile: UserProfile | null;
  isLoggedIn: boolean;
}

const days = ['월', '화', '수', '목', '금'];
const periods = [1, 2, 3, 4, 5, 6, 7];
type SubjectCode = 'A' | 'B' | 'C' | 'D';

const subjectScheduleByGradeAndClass: {
  [grade: number]: {
    [classNum: number]: {
      [day: string]: { [period: number]: SubjectCode };
    };
  };
} = {
  2: {
    9: {
      월: { 2: 'A', 3: 'A', 6: 'C', 7: 'D' },
      화: { 1: 'B', 2: 'B' },
      수: { 6: 'A' },
      목: { 2: 'D', 3: 'D', 7: 'B' },
      금: { 1: 'C', 2: 'C' },
    }
  },
  3: {
  },
};

const getDateRangeForWeek = () => {
  const today = new Date();
  const monday = new Date(today);
  monday.setDate(today.getDate() - ((today.getDay() + 6) % 7));
  const friday = new Date(monday);
  friday.setDate(monday.getDate() + 4);
  const format = (d: Date) => d.toISOString().split('T')[0].replace(/-/g, '');
  return {
    from: format(monday),
    to: format(friday),
  };
};

const getKoreanDay = (dateStr: string) => {
  const date = new Date(
    `${dateStr.substring(0, 4)}-${dateStr.substring(4, 6)}-${dateStr.substring(6, 8)}`
  );
  const map = ['일', '월', '화', '수', '목', '금', '토'];
  return map[date.getDay()];
};

const getTodayKoreanDay = () => {
  const map = ['일', '월', '화', '수', '목', '금', '토'];
  return map[new Date().getDay()];
};

const getSubjectTimetable = (profile: UserProfile) => {
  const gradeSchedule = subjectScheduleByGradeAndClass[profile.grade];
  if (!gradeSchedule) return {};
  const classSchedule = gradeSchedule[profile.class];
  if (!classSchedule) return {};
  const timetable: Record<string, Record<number, string>> = {};
  for (const day in classSchedule) {
    timetable[day] = {};
    for (const periodStr in classSchedule[day]) {
      const period = parseInt(periodStr, 10);
      const code = classSchedule[day][period];
      if (profile.subjects && profile.subjects[code]) {
        timetable[day][period] = profile.subjects[code];
      }
    }
  }
  return timetable;
};

const Timetable: React.FC<TimetableProps> = ({ profile, isLoggedIn }) => {
  const [data, setData] = useState<Record<string, Record<number, string>>>({});
  const [subjectCells, setSubjectCells] = useState<Record<string, Set<number>>>({});
  const todayKoreanDay = getTodayKoreanDay();

  useEffect(() => {
    const fetchTimetable = async () => {
      if (!isLoggedIn || !profile) return;
      const { from, to } = getDateRangeForWeek();
      const res = await fetch(
        `https://open.neis.go.kr/hub/hisTimetable?KEY=77900207b7c44afaa25a884ab581bb9f&Type=json&ATPT_OFCDC_SC_CODE=B10&SD_SCHUL_CODE=7010170&GRADE=${profile.grade}&CLASS_NM=${profile.class}&TI_FROM_YMD=${from}&TI_TO_YMD=${to}`
      );
      const json = await res.json();
      const items = json?.hisTimetable?.[1]?.row || [];
      const timetable: Record<string, Record<number, string>> = {};
      const subjectOnlyCells: Record<string, Set<number>> = {};

      items.forEach((item: any) => {
        const date = item.ALL_TI_YMD;
        const day = getKoreanDay(date);
        const period = parseInt(item.PERIO);
        const subject = item.ITRT_CNTNT;
        const teacher = item.TCHR_NM || '';
        const subjectDisplay = teacher ? `${subject} (${teacher})` : subject;
        if (!timetable[day]) timetable[day] = {};
        timetable[day][period] = subjectDisplay;
      });

      const subjectTimetable = getSubjectTimetable(profile);
      for (const day in subjectTimetable) {
        if (!timetable[day]) timetable[day] = {};
        if (!subjectOnlyCells[day]) subjectOnlyCells[day] = new Set();
        for (const periodStr in subjectTimetable[day]) {
          const period = parseInt(periodStr, 10);
          timetable[day][period] = subjectTimetable[day][period];
          subjectOnlyCells[day].add(period);
        }
      }

      setData(timetable);
      setSubjectCells(subjectOnlyCells);
    };

    fetchTimetable();
  }, [profile, isLoggedIn]);

  return (
    <div className={styles.container} style={{ position: 'relative' }}>
      {!isLoggedIn && (
        <div className={styles.loginOverlay}>
          <div className={styles.loginMessage}>로그인 후에 시간표를 확인해보세요!</div>
        </div>
      )}
      <div className={!isLoggedIn ? styles.blurContent : ''}>
        <h2 className={styles.title}>
          {profile ? `${profile.grade}학년 ${profile.class}반 시간표 ⏰` : '시간표 ⏰'}
        </h2>
        <table className={styles.timetable}>
          <thead>
            <tr>
              <th>교시</th>
              {days.map((day) => (
                <th
                  key={day}
                  className={day === todayKoreanDay ? styles.todayHeader : ''}
                >
                  {day}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {periods.map((period) => (
              <tr key={period}>
                <td>{period}</td>
                {days.map((day) => (
                  <td
                    key={`${day}-${period}`}
                    className={[
                      day === todayKoreanDay ? styles.todayCell : '',
                      subjectCells[day]?.has(period) ? styles.subjectCell : '',
                    ].join(' ').trim()}
                  >
                    {data[day]?.[period] || ''}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Timetable;
