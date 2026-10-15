import { useAuth } from '../hooks/useAuth';
import { TransferForm } from '../components/transfer/TransferForm';
import { ActivityChart } from '../components/dashboard/ActivityChart';
import { DepositSection } from '../components/deposit';
import { WithdrawSection } from '../components/withdraw';
import TransferHistory from '../components/transaction/TransferHistory';
import AccountOverview from '../components/account/AccountOverview';


//Temporary box for a feature that isn't merged yet.
//Each user replaces their box with the real component (which must keep the same id).

export default function DashboardPage(){
    //Logged in user,for the "welcome, xxx" heading
    //const{ user } = useAuth();
    const { user, updateBalance } = useAuth();

    return(
        //page background behind all containers
        <div className='min-h-screen bg-background'>
            <main className='mx-auto flex max-w-6xl flex-col gap-8 px-4 py-8'>

                {/* Navbar Dashboard button scrolls here */}
                <section id = "dashboard">
                {/* Small orange label with a line in front, as in the design */}
                <p className='flex items-center gap-2 text-small font-semibold uppercase tracking-widest text-secondary'>
                    <span className="h-0.5 w-6 bg-secondary" aria-hidden="true"/>
                    EVERYDAY BANKING
                </p>
                <h1 className="mt-1 text-heading font-bold text-text-main">Welcome, {user?.firstName}.</h1>
                {/* Account overview + transaction activity chart go here later */}
                                {/* Account overview (left, 1/3) + activity chart (right, 2/3). Stacked on phones. */}
                <div className="mt-6 grid gap-6 lg:grid-cols-3">
                    <AccountOverview />
                    <div className="lg:col-span-2">
                        <ActivityChart />
                    </div>
                </div>


                </section>
                {/* One container per navbar button. The ids must match the navbar.  */}
                <DepositSection onDeposited={updateBalance} />
                <WithdrawSection onWithdrawn={updateBalance} />
                <TransferForm />
                <TransferHistory />
                
                
                 

                </main> 
        </div>
    )
}