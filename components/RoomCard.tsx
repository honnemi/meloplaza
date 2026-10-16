
interface RoomProps {
    id: string;
    name: string;
    description: string;
    capacity: number;
    memberCount: number;
    isMember: boolean;
    isPending: boolean;
    onJoin: () => void;
}

export default function RoomCard({
    name,
    description,
    capacity,
    memberCount,
    isMember,
    isPending,
    onJoin,
}: RoomProps) {
    const isFull = memberCount >= capacity;

    return (
        <div className="flex flex-col border-2 border-win-border rounded-md shadow-md bg-win" style={{
            backgroundImage:
                "linear-gradient(180deg, #ffffff 0%, #d5f0f5 100%)",
        }}>
            <div className="w-full flex flex-row p-4 gap-4">
                <div className="w-[80%] min-w-0 flex flex-col gap-2">
                    <h2 className="text-lg font-bold break-words">{name}</h2>

                    <h3 className="font-bold text-sm text-gray-600">
                        Description
                    </h3>

                    <p className="text-xs text-gray-400 break-words">
                        {description}
                    </p>
                </div>

                <div className="w-[20%] shrink-0 flex flex-col items-end">
                    <p className="text-2xl font-bold font-heading">
                        {memberCount}/{capacity}
                    </p>
                    <p className="text-xs text-gray-400">
                        {memberCount === 1 ? "member" : "members"}
                    </p>
                </div>
            </div>

            <div className="flex flex-row gap-4 p-4 justify-end">
                    <button
                        type="button"
                        onClick={onJoin}
                        disabled={isPending || isFull}
                        className="px-4 py-3 text-sm font-bold border-2 border-win-border-dark rounded-sm bg-win-alt shadow-[3px_3px_0px_rgba(0,90,100,0.3)] hover:-translate-y-[1px] active:translate-y-[1px] cursor-pointer text-gray-800 font-heading disabled:opacity-50"
                        style={{
                            backgroundImage:
                                "linear-gradient(180deg, #ffffff 0%, #d5f0f5 100%)",
                        }}
                    >
                        {isFull ? "Room Full" : isPending ? "Please wait..." : "Visit Room"}
                    </button>
            </div>
        </div>
    );
}
