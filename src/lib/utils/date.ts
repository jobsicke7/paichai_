import { format, parseISO, isValid } from 'date-fns'
import { ko } from 'date-fns/locale'

/**
 * 날짜를 지정된 형식으로 포맷팅합니다.
 * @param date 변환할 날짜 (문자열, Date 객체 또는 타임스탬프)
 * @param pattern 형식 패턴 (기본값: 'yyyy-MM-dd')
 * @param locale 사용할 로케일 (기본값: 한국어)
 * @returns 포맷팅된 날짜 문자열
 */
export function formatDate(
  date: string | Date | number,
  pattern = 'yyyy-MM-dd',
  locale = ko
): string {
  try {
    let dateObj: Date;
  
    // 문자열인 경우 Date 객체로 변환
    if (typeof date === 'string') {
      dateObj = parseISO(date);
    } 
    else {
      dateObj = new Date(date);
    }

    if (!isValid(dateObj)) {
      console.warn('Invalid date provided:', date);
      return String(date);
    }

    return format(dateObj, pattern, { locale });
  } catch (error) {
    console.error('Error formatting date:', error);
    return String(date);
  }
}

export function formatRelativeTime(date: string | Date | number): string {
  return formatDate(date);
}
