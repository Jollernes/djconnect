import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 py-12 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <div className="font-bold text-white text-lg mb-2">FirmaDJ</div>
            <p className="text-sm text-slate-400">
              Danmarks nemmeste og tryggeste måde at booke DJ og mobildiskotek til firmafesten.
            </p>
            <p className="text-sm text-slate-500 mt-4">CVR-12345678 (demo)</p>
            <p className="text-sm text-slate-500">hello@firmadj.demo</p>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-3">Serviceområder</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/dj-til-firmafest" className="hover:text-white">DJ til firmafest</Link></li>
              <li><Link href="/dj-til-julefrokost" className="hover:text-white">DJ til julefrokost</Link></li>
              <li><Link href="/dj-til-sommerfest" className="hover:text-white">DJ til sommerfest</Link></li>
              <li><Link href="/dj-til-firmaarrangement" className="hover:text-white">DJ til firmaarrangement</Link></li>
              <li><Link href="/mobildiskotek-firmafest" className="hover:text-white">Mobildiskotek</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-3">FirmaDJ</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/pakker" className="hover:text-white">Pakker</Link></li>
              <li><Link href="/saadan-fungerer-det" className="hover:text-white">Sådan fungerer det</Link></li>
              <li><Link href="/tryghed-og-kvalitet" className="hover:text-white">Tryghed og kvalitet</Link></li>
              <li><Link href="/faq" className="hover:text-white">FAQ</Link></li>
              <li><Link href="/kontakt" className="hover:text-white">Kontakt</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-3">Juridisk</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/handelsbetingelser" className="hover:text-white">Handelsbetingelser</Link></li>
              <li><Link href="/privatlivspolitik" className="hover:text-white">Privatlivspolitik</Link></li>
              <li><Link href="/login" className="hover:text-white">Demo login</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-10 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-500">
            © {new Date().getFullYear()} FirmaDJ. Demo-platform. Alle priser vises ekskl. moms.
          </p>
          <Link href="/brief" className="text-sm bg-amber-500 hover:bg-amber-400 text-slate-900 px-4 py-2 rounded-full font-medium">
            Tjek dato og få match
          </Link>
        </div>
      </div>
    </footer>
  );
}
