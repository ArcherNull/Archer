// @ts-nocheck
import React from "react";
import styles from "./index.module.less";

const PBox = (props) => {
  const { title, subTitle, titleRightChildren, children } = props;
  return (
    <div className={styles.PBox}>
      <div className={styles.PBox_top}>
        <div className={styles.PBox_top_left}>
          <div className={styles.PBox_top_left_title}>{title}</div>
          <div className={styles.PBox_top_left_subTitle}>{subTitle}</div>
        </div>
        <div className={styles.PBox_top_right}>{titleRightChildren}</div>
      </div>
      <div className={styles.PBox_content}>{children}</div>
    </div>
  );
};

export default PBox;
