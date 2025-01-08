/* eslint-disable  @typescript-eslint/no-explicit-any */
import "./timeline.css";

export enum TimelineSide {
  Left,
  Right,
}

export function Timeline({ props, children }: { props: any; children: any }) {
  return (
    <div className="timeline" {...props}>
      {children}
    </div>
  );
}

export function TimelineEntry({
  side,
  content,
  title,
  props,
}: {
  side: TimelineSide;
  title: any;
  content: any;
  props?: any;
}) {
  return (
    <div
      className={`event container ${
        side == TimelineSide.Left ? "left" : "right"
      }`}
      {...props}
    >
      <div className="content">
        <span>{title}</span>
        {content}
      </div>
    </div>
  );
}
