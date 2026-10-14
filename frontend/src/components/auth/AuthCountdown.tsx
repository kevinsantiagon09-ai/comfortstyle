export default function AuthCountdown({ seconds }: { seconds: number }) {
    const remaining = Math.max(0, Math.ceil(seconds));
    const hours = Math.floor(remaining / 3600);
    const minutes = Math.floor((remaining % 3600) / 60);
    const remainingSeconds = remaining % 60;
    const time = hours > 0
        ? `${hours}:${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`
        : `${minutes}:${String(remainingSeconds).padStart(2, '0')}`;

    return <span role="timer" aria-live="off" className="tabular-nums">{time}</span>;
}
