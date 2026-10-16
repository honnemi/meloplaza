interface RoomProps {
    name: string,
    description: string,
    capacity: number
}

export default function RoomCard({name, description, capacity}: RoomProps) {
    
    return (
        <div className="flex flex-col g-win border-2 border-win-border rounded-md shadow-md">
        <div className="w-full h-full flex flex-row p-4 gap-4">
            <div className="w-[80%] flex flex-col gap-2">
                <h1 className="text-lg font-bold">{name}</h1>
                <h2 className="font-bold text-sm text-gray-600">Description</h2>
                <p className="text-sm text-gray-400">{description}</p>
            </div>
            <div className="w-[20%] flex flex-col items-end">
                <h1 className="text-[24px] font-bold">0/{capacity}</h1>
            </div>
        
        </div>
        <div className="flex flex-row gap-4 p-4 justify-end">
             <button
              type="submit"
              className="px-4 py-3 text-sm font-bold border-2 border-win-border-dark rounded-sm bg-win-alt shadow-[3px_3px_0px_rgba(0,90,100,0.3)] hover:-translate-y-[1px] active:translate-y-[1px] cursor-pointer text-gray-800 font-heading flex flex-row items-center justify-center gap-2 transition-transform disabled:opacity-50"
              style={{
                backgroundImage:
                  "linear-gradient(180deg, #ffffff 0%, #d5f0f5 100%)",
              }}
            >Join Room
            </button>
        </div>
        </div>
    )
}