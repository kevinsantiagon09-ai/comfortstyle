import { Outlet } from 'react-router-dom';
import Navbar from '../componets/Navbar';

export default function GuestLayout() {
    return (
        <>
            <Navbar />

            <main className="mx-auto max-w-7xl px-4 py-8">
                <Outlet />
            </main>
        </>
    );
}