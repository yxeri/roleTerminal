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
  scrollTo,
  observe,
  alwaysExpanded = false,
  checkWidth = false,
  dropdown = false,
  classNames = [],
}, ref) => {
  const observeHelper = useRef();
  const renderDone = useRef(false);
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

  const scroll = () => {
    if (scrollTo && renderDone.current && listRef.current && !hidden) {
      if (scrollTo.direction === 'bottom' && listRef.current.lastElementChild) {
        console.log('should scroll to bottom');
        listRef.current.lastElementChild.scrollIntoView({ behavior: 'smooth', block: 'end' });
      } else if (scrollTo.direction === 'top' && listRef.current.firstElementChild) {
        listRef.current.firstElementChild.scrollIntoView({ behavior: 'smooth', block: 'start' });
        console.log('should scroll to top');
      }
    }
  };

  useEffect(() => {
    scroll();

    renderDone.current = true;
  }, [children]);

  useEffect(() => {
    if (scrollTo && !scrollTo.skipFirstRender && listRef.current && !hidden) {
      if (scrollTo.direction === 'bottom' && listRef.current.lastElementChild) {
        listRef.current.lastElementChild.scrollIntoView({ behavior: 'auto', block: 'end' });
        console.log('should scroll to bottom');
      } else if (scrollTo.direction === 'top' && listRef.current.firstElementChild) {
        listRef.current.firstElementChild.scrollIntoView({ behavior: 'auto', block: 'start' });
        console.log('should scroll to top');
      }
    }
  }, []);

  useEffect(() => {
    let observer;

    if (listRef.current && observe) {
      observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            console.log('hiding');
            observeHelper.current.classList.add('hide');
          } else {
            console.log('showing');
            observeHelper.current.classList.remove('hide');
          }
        });
      }, {
        root: listRef.current,
        rootMargin: '50px',
        threshold: 1,
      });

      if (observe === 'upper' && listRef.current.firstElementChild) {
        observer.observe(listRef.current.firstElementChild);
      }

      if (observe === 'lower' && listRef.current.lastElementChild) {
        observer.observe(listRef.current.lastElementChild);
      }
    }

    return () => {
      if (observer) {
        observer.disconnect();
      }
    };
  }, []);

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
      {observe && observe === 'upper' && <Button key="upper" classNames={['upper']} ref={observeHelper} onClick={() => scroll()}><ArrowUp /></Button>}
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
      {observe && observe === 'lower' && <Button key="lower" classNames={['lower']} ref={observeHelper} onClick={() => scroll()}><ArrowDown /></Button>}
    </div>
  );
});

export default React.memo(List, (prevProps, newProps) => {
  const prevChildren = prevProps.children;
  const newChildren = newProps.children;

  if (Array.isArray(prevChildren) && Array.isArray(newChildren) && newChildren.every((child, index) => prevChildren[index] && prevChildren[index].key === child.key)) {
    return true;
  }

  return false;
});

List.propTypes = {
  children: node,
  title: node,
  classNames: arrayOf(string),
  dropdown: bool,
  scrollTo: shape({
    direction: string,
    buffer: bool,
  }),
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
