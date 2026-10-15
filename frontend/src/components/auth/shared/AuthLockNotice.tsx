import AuthCountdown from './AuthCountdown';

export default function AuthLockNotice({ seconds, message }: { seconds: number; message: string }) {
    if (seconds <= 0) return null;

    return <div className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
        <p role="alert">{message}</p>
        <p className="mt-1">Podrás volver a intentarlo en <AuthCountdown seconds={seconds} />.</p>
    </div>;
}
