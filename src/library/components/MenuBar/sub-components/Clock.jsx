import React, { useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

import { getTimestamp } from '../../../redux/selectors/config';
import { ReactComponent as ClockSvg } from '../../../icons/clock.svg';
import Button from '../../common/sub-components/Button/Button';

const Clock = () => {
  const [date, setDate] = useState(new Date());
  const [showTime, setShowTime] = useState(false);
  const timestamp = useSelector((state) => getTimestamp(state, { date }));

  const updateTime = () => {
    setTimeout(() => {
      setDate(new Date());
      updateTime();
    }, 1000);
  };

  useEffect(() => {
    updateTime();
  }, []);

  const onClick = useCallback(() => setShowTime(!showTime), [showTime]);

  return (
    <div
      key="clock"
      className="Clock"
    >
      <Button onClick={onClick} classNames={[`${showTime ? 'hide' : ''}`]}><ClockSvg /></Button>
      <Button onClick={onClick} classNames={[`${!showTime ? 'hide' : ''}`]}>{timestamp.halfTime}</Button>
    </div>
  );
};

export default React.memo(Clock);
