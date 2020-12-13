import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { getTimestamp } from '../../../redux/selectors/config';

const Clock = () => {
  const [date, setDate] = useState(Date.now());
  const timestamp = useSelector((state) => getTimestamp(state, { date }));

  const updateTime = () => {
    setTimeout(() => {
      setDate(Date.now());
      updateTime();
    }, 400);
  };

  useEffect(() => {
    updateTime();
  }, []);

  return (
    <div
      key="clock"
      className="Clock"
    >
      <span>{timestamp.halfTime}</span>
    </div>
  );
};

export default Clock;
