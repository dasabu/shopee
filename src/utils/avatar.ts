export const getAvatarUrl = (avatar?: string) => {
  return avatar
    ? `${import.meta.env.VITE_API_URL}/images/${avatar}`
    : '/src/assets/default-user.jpg'
}
