import React from "react";

// Lightweight placeholders for Cal.com modules used in tests
export const Cal: React.FC<any> = (props) => (
  <div data-testid="cal-widget" data-event-type={props?.calLink || props?.eventType || ""} />
);

export const CalProvider: React.FC<any> = ({ children }) => <>{children}</>;
export const useCal = () => ({ open: () => {}, close: () => {} });
export const getCalApi = async () => ({ ui: { open: () => {}, close: () => {} } });
export const getCalApiCore = async () => ({ ui: { open: () => {}, close: () => {} } });

export default {};
