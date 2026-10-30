/* Email accounts and cloud sync through Supabase.
   Active only when js/config.js has a Supabase URL and anon key; otherwise app.js keeps the on-device PIN accounts. */
const CFG=window.DD_CONFIG||{};
const sb=(CFG.supabaseUrl&&CFG.supabaseAnonKey&&window.supabase)?window.supabase.createClient(CFG.supabaseUrl,CFG.supabaseAnonKey,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}}):null;
const Cloud={
  user:null,
  key(){return"deen-diary-v1:u:"+this.user.id},
  readLocal(){try{return JSON.parse(localStorage.getItem(this.key())||"null")}catch(e){return null}},
  writeLocal(d){try{localStorage.setItem(this.key(),JSON.stringify(d));localStorage.setItem(this.key()+":dirty","1")}catch(e){}},
  isDirty(){try{return!!localStorage.getItem(this.key()+":dirty")}catch(e){return false}},
  clean(){try{localStorage.removeItem(this.key()+":dirty")}catch(e){}},
  /* newest copy wins: the phone's unsynced edits, or the cloud copy written from another device */
  async load(){const local=this.readLocal();let cloud=null,ok=false;
    try{const{data,error}=await sb.from("user_data").select("data").eq("user_id",this.user.id).maybeSingle();if(!error){ok=true;cloud=data&&data.data}}catch(e){}
    if(local&&cloud)return(local._updated||0)>=(cloud._updated||0)?local:cloud;
    return cloud||local||null},
  timer:null,
  queue(d){this.writeLocal(d);clearTimeout(this.timer);this.timer=setTimeout(()=>this.push(d),1200)},
  async push(d){if(!this.user||!navigator.onLine)return false;
    const{error}=await sb.from("user_data").upsert({user_id:this.user.id,data:d,updated_at:new Date(d._updated||Date.now()).toISOString()});
    if(!error)this.clean();return!error},
};
