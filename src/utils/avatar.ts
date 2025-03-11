import DefaultAvatar from '@/assets/default-user.jpg'

export const getAvatarUrl = (avatar?: string) => {
  return avatar
    ? `${import.meta.env.VITE_API_URL}/images/${avatar}`
    : DefaultAvatar
}
