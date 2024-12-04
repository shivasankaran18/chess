

export class GameManager{
    private static gameManager:GameManager | null;
    private pendingUser:WebSocket |null;

    private constructor()
    {
        this.pendingUser=null;
    }
    public static getInstance()
    {
        if(!this.gameManager)
        {
            this.gameManager=new GameManager();
            return this.gameManager;
        }
        return this.gameManager;
    }

    public addUser(user:WebSocket)
    {
        if(!this.pendingUser)
        {
            this.pendingUser=user;
        }
        else
        {
            // addGame(this.pendingUser,user);
            this.pendingUser=null;
        }
    }
    public removeUser(user:WebSocket)
    {

    }


}