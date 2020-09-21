import React, { useEffect, useState } from 'react';

import textTools from '../../../TextTools';

const Clock = () => {
  const [time, setTime] = useState(textTools.generateTimestamp({ date: Date.now() }).halfTime);

  function updateTime () {
    setTimeout(() => {
      setTime(textTools.generateTimestamp({ date: Date.now() }).halfTime);
      updateTime();
    }, 100);
  }

  useEffect(() => {
    updateTime();
  }, []);

  return (
    <div
      key="clock"
      className="clock"
    >
      <span>{time}</span>
    </div>
  );
};

export default Clock;
