import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  string,
  bool,
  node,
} from 'prop-types';

import { ReactComponent as ArrowUp } from '../../../../icons/arrow-up-circle.svg';
import { ReactComponent as ArrowDown } from '../../../../icons/arrow-down-circle.svg';
import Button from '../../sub-components/Button/Button';

import './List.scss';

const List = React.forwardRef(({
  children,
  title,
  observe,
  startRevealed = false,
  alwaysExpanded = false,
  checkWidth = false,
  dropdown = false,
  className = '',
}, ref) => {
  const observer = useRef();
  const observeHelper = useRef();
  const listRef = useRef(null);
  const windowRef = useRef(null);
  const [hidden, setHidden] = useState(!startRevealed && !alwaysExpanded && typeof title !== 'undefined');
  const listClasses = [];
  const classes = ['List'].concat([className]);

  const onClick = useCallback((event) => {
    if (dropdown && !hidden && listRef.current && (!checkWidth || !windowRef.current || windowRef.current.offsetWidth < 600)) {
      if (event.target.tagName !== 'INPUT' && (!listRef.current.parentElement.contains(event.target) || (event.target !== listRef.current && event.currentTarget === listRef.current))) {
        setHidden(true);
      }
    }
  }, [hidden]);

  const scroll = ({ direction }) => {
    if (direction === 'bottom' && listRef.current.lastElementChild) {
      listRef.current.lastElementChild.scrollIntoView({ behavior: 'smooth', block: 'end' });
    } else if (direction === 'top' && listRef.current.firstElementChild) {
      listRef.current.firstElementChild.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  useEffect(() => {
    if (!hidden && dropdown && listRef.current) {
      const bounds = listRef.current.getBoundingClientRect();

      if (bounds.right > window.innerWidth) {
        listRef.current.classList.add('right');
      } else {
        listRef.current.classList.remove('right');
      }

      if (bounds.bottom > window.innerHeight) {
        listRef.current.classList.add('bottom');
      } else {
        listRef.current.classList.remove('bottom');
      }
    }
  }, [hidden]);

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
        document.addEventListener('mousedown', onClick);
      } else {
        document.removeEventListener('mousedown', onClick);
      }
    }

    return () => document.removeEventListener('mousedown', onClick);
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
      {observe && observe === 'upper' && <Button key="upper" className="upper hide" ref={observeHelper} onClick={() => scroll({ direction: 'top' })}><ArrowUp /></Button>}
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
      {observe && observe === 'lower' && <Button key="lower" className="lower hide" ref={observeHelper} onClick={() => scroll({ direction: 'bottom' })}><ArrowDown /></Button>}
    </div>
  );
});

export default React.memo(List);

List.propTypes = {
  children: node,
  title: node,
  className: string,
  dropdown: bool,
  checkWidth: bool,
  alwaysExpanded: bool,
  observe: string,
  startRevealed: bool,
};

List.defaultProps = {
  className: '',
  children: undefined,
  title: undefined,
  dropdown: false,
  checkWidth: false,
  alwaysExpanded: false,
  observe: undefined,
  startRevealed: undefined,
};
