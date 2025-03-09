import { ExtendedPurchases } from '@/types/purchase.type'
import { User } from '@/types/user.type'
import { getAccessTokenFromLS, getProfileFromLS } from '@/utils/auth'
import { createContext, useState } from 'react'

interface AppContextInterface {
  isAuthenticated: boolean
  setIsAuthenticated: React.Dispatch<React.SetStateAction<boolean>>
  profile: User | null
  setProfile: React.Dispatch<React.SetStateAction<User | null>>
  purchasesExtended: ExtendedPurchases[]
  setPurchasesExtended: React.Dispatch<
    React.SetStateAction<ExtendedPurchases[]>
  >
}

const initialAppContext: AppContextInterface = {
  isAuthenticated: Boolean(getAccessTokenFromLS()),
  setIsAuthenticated: () => null,
  profile: getProfileFromLS(),
  setProfile: () => null,
  purchasesExtended: [],
  setPurchasesExtended: () => null
}

export const AppContext = createContext<AppContextInterface>(initialAppContext)

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(
    initialAppContext.isAuthenticated
  )
  const [profile, setProfile] = useState<User | null>(initialAppContext.profile)

  const [purchasesExtended, setPurchasesExtended] = useState<
    ExtendedPurchases[]
  >(initialAppContext.purchasesExtended)

  return (
    <AppContext.Provider
      value={{
        isAuthenticated,
        setIsAuthenticated,
        profile,
        setProfile,
        purchasesExtended,
        setPurchasesExtended
      }}
    >
      {children}
    </AppContext.Provider>
  )
}
