import Link from "next/link";

export default function App() {
    return (
        <div className="flex flex-col items-center justify-center h-screen">
          <Link href={"/chat"} className="hover:cursor-pointer">GO TO /chat</Link>
        </div>
    )
}

