import { useAuthCountdown } from '../../../hooks/auth/shared/useAuthCountdown';

export default function AuthCountdown({ seconds }: { seconds: number }) {
    const time = useAuthCountdown(seconds);

    return <span role="timer" aria-live="off" className="tabular-nums">{time}</span>;
}
