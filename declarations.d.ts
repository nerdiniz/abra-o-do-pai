declare module "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js" {
    import * as m from "firebase/app";
    export * from "firebase/app";
    export default m;
}

declare module "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js" {
    import * as m from "firebase/auth";
    export * from "firebase/auth";
    export default m;
}

declare module "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js" {
    import * as m from "firebase/firestore";
    export * from "firebase/firestore";
    export default m;
}

// Re-declare for common usage if necessary
declare module "recharts";
declare module "lucide-react";
