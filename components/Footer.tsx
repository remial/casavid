import Link from "next/link";

export default function Footer() {
  return (
    <footer className="text-center px-4 lg:px-40 py-8 w-full mt-5 flex flex-col md:flex-row justify-between items-start border-t border-gray-200 gap-8">
      
      <div className="flex flex-col text-left text-gray-500 space-y-2">
        <h3 className="text-gray-700 font-bold">Company</h3>
        <Link className="hover:underline hover:text-blue-600" href="https://www.vidnarrate.com" target="_blank">
          Vidnarrate
        </Link>
        
      </div>
     
      <div className="flex flex-col text-left text-gray-500 space-y-2">
        <h3 className="text-gray-700 font-bold">Legal</h3>
        <Link className="hover:underline hover:text-blue-600" href="/terms-conditions" prefetch={false}>
          Terms of Service
        </Link>
        <Link className="hover:underline hover:text-blue-600" href="/privacy-policy" prefetch={false}>
          Privacy Policy
        </Link>
      </div>

      <div className="flex flex-col text-left text-gray-500 space-y-2">
        <h3 className="text-gray-700 font-bold">CasaVid</h3>
        <Link
          className="hover:underline hover:text-blue-600"
          href="/contact"
        >
          Contact Us
        </Link>
       
      </div>
    </footer>
  );
}
