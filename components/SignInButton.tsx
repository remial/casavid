import { signIn } from "next-auth/react";


function SignInButton() {
  return (
    <button 
    
      className="w-full lg:w-1/2 rounded-full text-xl" 
      style={{backgroundColor: 'blue', color: 'white'}} 
      onClick={() => signIn()}
    >
      Start Now!
    </button>
  );
}

export default SignInButton 