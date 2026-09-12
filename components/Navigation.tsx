import { Link } from "next-view-transitions";

export default function Navigation() {
    return (
        <div className="flex flex-row justify-center gap-50 p-10">
            <Link href="/" className="flex flex-col gap-2 items-center hover:text-blue-600 transition-colors">
                <i className="hn hn-logout-solid"></i>
                <span className="font-bold">Exit</span>
            </Link>
            <Link href="#" className="flex flex-col gap-2 items-center hover:text-blue-600 transition-colors">
                <i className="hn hn-bell-solid"></i>
                <span className="font-bold">Notifications</span>
            </Link>
            <Link href="#" className="flex flex-col gap-2 items-center hover:text-blue-600 transition-colors">
                <i className="hn hn-disc-solid"></i>
                <span className="font-bold">Collection</span>
            </Link>
            <Link href="#" className="flex flex-col gap-2 items-center hover:text-blue-600 transition-colors">
                <i className="hn hn-user-solid"></i>
                <span className="font-bold">Profile</span>
            </Link>
        </div>
    )
}