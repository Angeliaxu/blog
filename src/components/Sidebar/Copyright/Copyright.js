// @flow strict
import React from 'react';
import styles from './Copyright.module.scss';

type Props = {
  copyright: string
};

const Copyright = ({ copyright }: Props) => (
  <div>
    <div className={styles['copyright']}>
      {copyright}
    </div>
    <div className={styles['copyright']}>京ICP备19052487号-1</div>
  </div>
);

export default Copyright;
