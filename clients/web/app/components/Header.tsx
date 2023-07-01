import Link from "next/link";

const Header = () => {
  return (
    <header className="bg-gray-800 py-4">
      <nav className="container mx-auto">
        <ul className="flex justify-between">
          <li>
            <Link className="text-white" href="/">
              Chat GPT UI
            </Link>
          </li>
          <li>
            <Link className="text-white" href="/pi">
              HeyPi UI
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  );
};

export default Header;
