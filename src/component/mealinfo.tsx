'use client';

import React, { useEffect, useState } from 'react';
import styles from './mealinfo.module.css';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { ko } from 'date-fns/locale';

const formatDate = (date: Date) => {
  const y = date.getFullYear();
  const m = `${date.getMonth() + 1}`.padStart(2, '0');
  const d = `${date.getDate()}`.padStart(2, '0');
  return `${y}${m}${d}`;
};

const formatDisplayDate = (date: Date) =>
  `${date.getMonth() + 1}월 ${date.getDate()}일 급식`;

const getMealTypeLabel = (type: number) => {
  switch (type) {
    case 1:
      return '조식';
    case 2:
      return '중식';
    case 3:
      return '석식';
    default:
      return '';
  }
};

const MealInfo = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [mealData, setMealData] = useState<{ [key: string]: string[] }>({});
  const [showCalendar, setShowCalendar] = useState(false);

  useEffect(() => {
    const fetchMeals = async () => {
      const dateStr = formatDate(selectedDate);
      const res = await fetch(
        `https://open.neis.go.kr/hub/mealServiceDietInfo?KEY=77900207b7c44afaa25a884ab581bb9f&Type=json&ATPT_OFCDC_SC_CODE=B10&SD_SCHUL_CODE=7010170&MLSV_YMD=${dateStr}`
      );
      const json = await res.json();
      const items = json?.mealServiceDietInfo?.[1]?.row || [];

      const result: { [key: string]: string[] } = {};
      items.forEach((item: any) => {
        const mealType = getMealTypeLabel(parseInt(item.MMEAL_SC_CODE));
        const dishes = item.DDISH_NM?.split('<br/>') || [];
        result[mealType] = dishes;
      });

      setMealData(result);
    };

    fetchMeals();
  }, [selectedDate]);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>{formatDisplayDate(selectedDate)} 🌕</h2>
        <button className={styles.calendarBtn} onClick={() => setShowCalendar(!showCalendar)}>
          날짜 변경하기 📅
        </button>
        {showCalendar && (
          <div className={styles.datepicker}>
            <DatePicker
            selected={selectedDate}
            onChange={(date: Date | null) => {
                if (date) {
                setSelectedDate(date);
                setShowCalendar(false);
                }
            }}
            inline
            dateFormat="yyyy-MM-dd"
            locale={ko}
            />
          </div>
        )}
      </div>
      <div className={styles.mealContainer}>
        {['조식', '중식', '석식'].map((meal) => (
          <div className={styles.mealCard} key={meal}>
            <h3>{meal}</h3>
            {mealData[meal]?.length ? (
              mealData[meal].map((dish, idx) => <div key={idx}>{dish}</div>)
            ) : (
              <div>데이터 없음</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MealInfo;
