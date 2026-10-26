type AvatarProps = {
  username: string;
  avatarUrl?: string | null;
  size?: number;
};

const colors = [
  "bg-red-500",
  "bg-blue-500",
  "bg-yellow-500",
  "bg-green-500",
  "bg-purple-500",
  "bg-pink-500",
  "bg-indigo-500",
  "bg-orange-500",
];

function getInitials(username: string) {
  return username.slice(0, 2).toUpperCase();
}

function getAvatarColor(username: string) {
  let hash = 0;

  for (let i = 0; i < username.length; i++) {
    hash += username.charCodeAt(i);
  }

  return colors[hash % colors.length];
}

export default function UserCard({
  username,
  avatarUrl,
  size = 80,
}: AvatarProps) {
  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={`Avatar de ${username}`}
        width={size}
        height={size}
        className="rounded-full object-cover"
      />
    );
  }

  return (
    <div
      className={`${getAvatarColor(username)} rounded-full flex items-center justify-center text-white font-bold`}
      style={{
        width: size,
        height: size,
        fontSize: size * 0.35,
      }}
    >
      {getInitials(username)}
    </div>
  );
}