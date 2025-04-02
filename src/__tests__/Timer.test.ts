import { Timer } from 'utils';

describe('Timer', () => {
  let timer: Timer;
  let callback: jest.Mock;

  beforeEach(() => {
    callback = jest.fn();
    jest.useFakeTimers();
    timer = new Timer(callback, 1000);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('callback', () => {
    jest.advanceTimersByTime(1000);
    expect(callback).toHaveBeenCalledTimes(1);
  });

  test('no callback', () => {
    jest.advanceTimersByTime(500);
    expect(callback).not.toHaveBeenCalled();
  });

  test('pause', () => {
    jest.advanceTimersByTime(500);
    timer.pause();
    jest.advanceTimersByTime(1000);
    expect(callback).not.toHaveBeenCalled();
    expect(timer.getTimeLeft()).toBe(500);
    jest.advanceTimersByTime(500);
    timer.pause();
    expect(timer.getTimeLeft()).toBe(500);

    timer.start();
    jest.advanceTimersByTime(1000);
    expect(callback).toHaveBeenCalledTimes(1);
  });

  test('get time', () => {
    jest.advanceTimersByTime(400);
    expect(timer.getTimeLeft()).toBe(600);
  });

  test('pause after timeout', () => {
    jest.advanceTimersByTime(1000);
    expect(callback).toHaveBeenCalledTimes(1);
    timer.pause();
  });

  test('start after timeout', () => {
    jest.advanceTimersByTime(1000);
    expect(callback).toHaveBeenCalledTimes(1);
    timer.start();
    jest.advanceTimersByTime(1000);
    expect(callback).toHaveBeenCalledTimes(1);
  });

  test('is running', () => {
    expect(timer.isRunning()).toBe(true);
    timer.pause();
    expect(timer.isRunning()).toBe(false);
  });
});