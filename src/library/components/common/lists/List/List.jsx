import React, { useEffect, useRef, useState } from 'react';
import {
  string,
  arrayOf,
  bool,
  node,
  shape,
} from 'prop-types';

import { ReactComponent as ArrowUp } from '../../../../icons/arrow-up-circle.svg';
import { ReactComponent as ArrowDown } from '../../../../icons/arrow-down-circle.svg';

import './List.scss';
import Button from '../../sub-components/Button/Button';

const List = React.forwardRef(({
  children,
  title,
  observe,
  alwaysExpanded = false,
  checkWidth = false,
  dropdown = false,
  classNames = [],
}, ref) => {
  const observer = useRef();
  const observeHelper = useRef();
  const listRef = useRef(null);
  const windowRef = useRef(null);
  const [hidden, setHidden] = useState(!alwaysExpanded && typeof title !== 'undefined');
  const listClasses = [];
  const classes = ['List'].concat(classNames);

  const onClick = (event) => {
    if (dropdown && listRef.current && (!checkWidth || !windowRef.current || windowRef.current.offsetWidth < 600)) {
      if (event.target === listRef.current || !listRef.current.parentElement.contains(event.target)) {
        setHidden(true);
      }
    }
  };

  const scroll = ({ direction }) => {
    if (direction === 'bottom' && listRef.current.lastElementChild) {
      console.log('should scroll to bottom');
      listRef.current.lastElementChild.scrollIntoView({ behavior: 'smooth', block: 'end' });
    } else if (direction === 'top' && listRef.current.firstElementChild) {
      listRef.current.firstElementChild.scrollIntoView({ behavior: 'smooth', block: 'start' });
      console.log('should scroll to top');
    }
  };

  // useEffect(() => {
  //   scroll();
  //
  //   renderDone.current = true;
  // }, [children]);
  //
  // useEffect(() => {
  //   if (scrollTo && !scrollTo.skipFirstRender && listRef.current && !hidden) {
  //     if (scrollTo.direction === 'bottom' && listRef.current.lastElementChild) {
  //       listRef.current.lastElementChild.scrollIntoView({ behavior: 'auto', block: 'end' });
  //       console.log('should scroll to bottom');
  //     } else if (scrollTo.direction === 'top' && listRef.current.firstElementChild) {
  //       listRef.current.firstElementChild.scrollIntoView({ behavior: 'auto', block: 'start' });
  //       console.log('should scroll to top');
  //     }
  //   }
  // }, []);
  //

  useEffect(() => {
    if (listRef.current && observe) {
      observer.current = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            observeHelper.current.classList.add('hide');
          } else {
            observeHelper.current.classList.remove('hide');
          }
        });
      }, {
        root: listRef.current,
        rootMargin: '50px',
        threshold: 1,
      });

      if (observe === 'upper' && listRef.current.firstElementChild) {
        observer.current.observe(listRef.current.firstElementChild);
      }

      if (observe === 'lower' && listRef.current.lastElementChild) {
        observer.current.observe(listRef.current.lastElementChild);
      }
    }

    return () => {
      if (observer.current) {
        observer.current.disconnect();
      }
    };
  }, []);

  useEffect(() => {
    if (observer.current) {
      observer.current.disconnect();

      if (observe === 'upper' && listRef.current.firstElementChild) {
        observer.current.observe(listRef.current.firstElementChild);
      }

      if (observe === 'lower' && listRef.current.lastElementChild) {
        observer.current.observe(listRef.current.lastElementChild);
      }
    }
  }, [children]);

  useEffect(() => {
    if (dropdown) {
      if (!hidden) {
        document.addEventListener('mousedown', onClick, false);
      } else {
        document.removeEventListener('mousedown', onClick, false);
      }
    }
  }, [hidden]);

  if (!hidden) {
    classes.push('expanded');
  } else {
    listClasses.push('hide');
  }

  if (dropdown) {
    listClasses.push('dropdown');
  }

  return (
    <div
      key="List"
      className={classes.join(' ')}
    >
      { title && (
        <header
          role="button"
          tabIndex={0}
          key="listHeader"
          className={`toggle ${!alwaysExpanded ? 'clickable' : ''}`}
          onClick={() => {
            if (!alwaysExpanded) {
              setHidden(!hidden);
            }
          }}
        >
          {title}
        </header>
      )}
      {observe && observe === 'upper' && <Button key="upper" classNames={['upper', 'hide']} ref={observeHelper} onClick={() => scroll({ direction: 'top' })}><ArrowUp /></Button>}
      <ul
        ref={(element) => {
          listRef.current = element;

          if (ref) {
            ref.current = element;
          }

          if (element) {
            windowRef.current = element.closest('.Window');
          }
        }}
        key="listElem"
        className={`${listClasses.join(' ')}`}
        onClick={(event) => {
          if (dropdown) {
            onClick(event);

            event.stopPropagation();
          }
        }}
      >
        {children}
      </ul>
      {observe && observe === 'lower' && <Button key="lower" classNames={['lower', 'hide']} ref={observeHelper} onClick={() => scroll({ direction: 'bottom' })}><ArrowDown /></Button>}
    </div>
  );
});

export default React.memo(List);

List.propTypes = {
  children: node,
  title: node,
  classNames: arrayOf(string),
  dropdown: bool,
  checkWidth: bool,
  alwaysExpanded: bool,
  observe: string,
};

List.defaultProps = {
  classNames: [],
  children: undefined,
  title: undefined,
  dropdown: false,
  scrollTo: undefined,
  checkWidth: false,
  alwaysExpanded: false,
  observe: undefined,
};
