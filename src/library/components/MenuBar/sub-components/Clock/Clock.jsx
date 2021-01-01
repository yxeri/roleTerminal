import React, { useCallback, useEffect, useState } from 'react';

import { getTimestamp } from '../../../../redux/selectors/config';
import { ReactComponent as ClockSvg } from '../../../../icons/clock.svg';
import Button from '../../../common/sub-components/Button/Button';
import store from '../../../../redux/store';

import './Clock.scss';

const Clock = () => {
  const [date, setDate] = useState(new Date());
  const [showTime, setShowTime] = useState(false);
  const timestamp = getTimestamp(store.getState(), { date });

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
      <Button className={`icon ${showTime ? 'active' : ''}`} onClick={onClick}><ClockSvg /></Button>
      <Button onClick={onClick} className={`time ${!showTime ? 'hide' : ''}`}>{timestamp.halfTime}</Button>
    </div>
  );
};

export default React.memo(Clock);
