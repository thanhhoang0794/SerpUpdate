/* eslint-disable @next/next/no-img-element */
import React from 'react';
import Link from 'next/link';
import Icon from './Icon';
import { usePathname } from 'next/navigation';

type SidebarProps = {
   domains: DomainType[],
   showAddModal: Function
}

const Sidebar = ({ domains, showAddModal } : SidebarProps) => {
   const pathname = usePathname();
   

   return (
      <div className="sidebar pt-44 w-1/5 hidden lg:block" data-testid="sidebar">
         <h3 className="py-7 text-base font-bold text-blue-700">
            <span className=' relative top-[3px] mr-1'><Icon type="logo" size={24} color="#364AFF" /></span> SerpUpdate
         </h3>
         <div className="sidebar_menu max-h-96 overflow-auto styled-scrollbar">
            <ul className=' font-medium text-sm'>
               {domains.map((d) => <li
                                 key={d.domain}
                                 className={'my-2.5 leading-10'}>
                                    <Link href={`/domain/${d.slug}`} passHref={true} legacyBehavior>
                                       <a className={`block cursor-pointer px-4 text-ellipsis max-w-[215px] overflow-hidden whitespace-nowrap rounded
                                        rounded-r-none ${((`/domain/${d.slug}` === pathname || `/domain/console/${d.slug}` === pathname
                                        || `/domain/insight/${d.slug}` === pathname || `/domain/ideas/${d.slug}` === pathname)
                                        ? 'bg-white text-zinc-800 border border-r-0' : 'text-zinc-500')}`}>
                                          <img
                                          className={' inline-block mr-1'}
                                          src={`https://www.google.com/s2/favicons?domain=${d.domain}&sz=16`} alt={d.domain}
                                          />
                                          {d.domain}
                                       </a>
                                    </Link>
                                 </li>)
               }
            </ul>
         </div>
         <div className='sidebar_add border-t font-semibold text-sm text-center mt-6 w-[80%] ml-3 text-zinc-500'>
            <button data-testid="add_domain" onClick={() => showAddModal(true)} className='p-4 hover:text-blue-600'>+ Add Domain</button>
         </div>
    </div>
   );
 };

 export default Sidebar;
