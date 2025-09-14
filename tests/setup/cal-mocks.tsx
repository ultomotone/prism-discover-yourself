import React from "react";

// Lightweight placeholders for Cal.com modules used in tests
export const Cal: React.FC<any> = (props) => (
  <div data-testid="cal-widget" data-event-type={props?.calLink || props?.eventType || ""} />
);

export const CalProvider: React.FC<any> = ({ children }) => <>{children}</>;

// eslint-disable-next-line react-refresh/only-export-components -- re-export Cal utilities for tests
export { useCal, getCalApi, getCalApiCore } from "./cal-mocks.utils";

export default Cal;
