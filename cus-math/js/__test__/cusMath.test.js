/*
 * @Author: junsong Chen  779217162@qq.com
 * @Date: 2025-12-04 08:45:12
 * @LastEditors: junsong Chen  779217162@qq.com
 * @LastEditTime: 2025-12-04 10:36:12
 * @Description:
 */
import { describe, expect, it } from 'vitest';

import { CusMath } from '../cusMath.js';

describe('cusMath utils', () => {
  const cusMath = new CusMath();
  it('expression: 5+-7+1+1', () => {
    expect(cusMath.expression('5+-7+1+1').end()).toBe(0);
  });

  it('expression: 0.1+0.2', () => {
    expect(cusMath.expression('0.1+0.2').end()).toBe(0.3);
  });

  it('expression: ((20.124 * 2.35 / 5.96 + 20.124 * 65 / 3 - 20.124 + 2.35 * 5.96) / 2.36) * 3.241 + 2.53 * 5.96', () => {
    expect(
      cusMath
        .expression(
          '((20.124 * 2.35 / 5.96 + 20.124 * 65 / 3 - 20.124 + 2.35 * 5.96) / 2.36) * 3.241 + 2.53 * 5.96',
        )
        .end(),
    ).toBe(616.362_301_885_452);
  });

  it('expression: 3.251+253.635+1.25+42-63.652-4.952', () => {
    expect(cusMath.add(3.251, 253.635, 1.25, 42).sub(63.652, 4.952).end()).toBe(
      231.532,
    );
  });

  it('expression: 0.3/2', () => {
    expect(cusMath.expression('0.3/2').end()).toBe(0.15);
  });

  it('expression: -1+-2', () => {
    expect(cusMath.expression('-1+-2').end()).toBe(-3);
  });

  it('expression: 1-7', () => {
    expect(cusMath.expression('1-7').end()).toBe(-6);
  });

  it('expression: -1.1--3.5', () => {
    expect(cusMath.expression('-1.1--3.5').end()).toBe(2.4);
  });

  // it('expression: -27.90-20.98+-18.62/-93.13/65.58/-1.05+34.86*-5.13/-39.16*-36.56/43.72-73.51-90.79/4.53+-38.42+-42.08-43.10', () => {
  //   expect(
  //     cusMath
  //       .expression(
  //         '-27.90-20.98+-18.62/-93.13/65.58/-1.05+34.86*-5.13/-39.16*-36.56/43.72-73.51-90.79/4.53+-38.42+-42.08-43.10',
  //       )
  //       .end(),
  //   ).toBe(-269.853_656_571_950_7);
  // });
});
