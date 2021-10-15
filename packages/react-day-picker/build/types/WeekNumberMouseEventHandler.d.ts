/// <reference types="react" />
/**Represent the event handler when the week number gets a mouse event . */
export declare type WeekNumberMouseEventHandler = (
/** The week number that triggered the event. */
weekNumber: number, 
/** The dates in the triggered week. */
dates: Date[], 
/** The mouse event that triggered this event. */
e: React.MouseEvent) => void;
