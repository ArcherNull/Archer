export type TablePageType = 'fullTable' | 'tabTable';

export interface PageProps {
  title?: string;
  description?: string;
  contentClass?: string;
  /**
   * 根据content可见高度自适应
   */
  autoContentHeight?: boolean;
  /**
   * 表格界面类型， fullTable表示全屏表格；tabTable表示带有tab的表格
   */
  tablePageType?: TablePageType;
  headerClass?: string;
  footerClass?: string;
  /**
   * Custom height offset value (in pixels) to adjust content area sizing
   * when used with autoContentHeight
   * @default 0
   */
  heightOffset?: number;
}
