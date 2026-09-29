import { Outlet } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';

export default function AuthLayout() {
    return (
        <>
            <Navbar />

            <main className="mx-auto max-w-md px-4 py-12">
                <Outlet />
            </main>
        </>
    );
}
