export const gamesData = [
  {
    name: 'Minecraft',
    value: 'minecraft',
    logoSrc: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxOCIgaGVpZ2h0PSIxOCIgdmlld0JveD0iMCAwIDI0IDI0Ij48cGF0aCBmaWxsPSIjNzgwODY4IiBkPSJNMCAwaDI0djI0SDB6IiBmaWxsLW9wYWNpdHk9IjAuMSIvPjxyZWN0IHg9IjQiIHk9IjQiIHdpZHRoPSIxNiIgaGVpZ2h0PSIxNiIgcng9IjAiIHJ5PSIwIiBmaWxsPSIjM2M0YjMyIi8+PHJlY3QgeD0iOCIgeT0iOCIgd2lkdGg9IjgiIGhlaWdodD0iOCIgcng9IjAiIHJ5PSIwIiBmaWxsPSIjYTg4NjAiLz48cmVjdCB4PSI4IiB5PSI0IiB3aWR0aD0iOCIgaGVpZ2h0PSI0IiByeD0iMCIgcnk9IjAiIGZpbGw9IiM3MDYwNDAiLz48cmVjdCB4PSI0IiB5PSI4IiB3aWR0aD0iNCIgaGVpZ2h0PSI4IiByeD0iMCIgcnk9IjAiIGZpbGw9IiM3MDYwNDAiLz48L3N2Zz4=', // From HomePage.vue
    passes: [ // From cart.spec.js
        { id: 'mc-standard', title: 'Standard Pass', price: '$9.99', type: 'standard', features: ["+ Feature A", "+ Feature B"] },
        { id: 'mc-deluxe', title: 'Deluxe Pass', price: '$19.99', type: 'deluxe', features: ["+ Feature C", "+ Feature D"] },
    ],
    gameSpecificFeature: "+ Realmwalker's Boon", // From cart.spec.js
    gameSpecificDiscount: "10% off companion packs" // From cart.spec.js
  },
  {
    name: 'Fortnite',
    value: 'fortnite',
    logoSrc: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxOCIgaGVpZ2h0PSIxOCIgdmlld0JveD0iMCAwIDI0IDI0Ij48cGF0aCBmaWxsPSIjOTA4MGE4IiBkPSJNMCAwaDI0djI0SDB6IiBmaWxsLW9wYWNpdHk9IjAuMSIvPjxwYXRoIGQ9Ik0xMiAyQzYuNDggMiAyIDYuNDggMiAxMnM0LjQ4IDEwIDEwIDEwIDEwLTQuNDggMTAtMTBTNzcuNTIgMiAxMiAyek04LjUgMTVjLTEuMzggMC0yLjUtMS4xMi0yLjUtMi41UzcuMTIgMTAgOC41IDEwczEuNjcuMiAyLjI1LjVsMS4yNS0zLjc1QzExLjE3IDkuNSA5LjgzIDkgOC41IDljLTIuNDggMC00LjUgMi00LjUgNC41UzYuMDIgMTggOC41IDE4czIuODMtLjUgMy41My0xLjI1bC0xLjI1LTEuNzVjLS41OC4zLTEuMzcuNS0yLjI4LjV6bTcgMGMtMS4zOCAwLTIuNS0xLjEyLTIuNS0yLjVzMS4xMi0yLjUgMi41LTIuNWMxLjMzIDAgMi42Ny41IDMuNSAxLjI1bC0xLjI1IDEuNzVjLS41OC0uMy0xLjM3LS41LTIuMjUtLjVzLTEuNjguMi0yLjI1LjVsMS4yNSAzLjc1Yy44My0uNyAxLjE3LTEuMjUgMy41My0xLjI1IDIuNDggMCA0LjUgMiA0LjUgNC41UzE3LjkSDE4IDE1LjUgMThzLTIuODMtLjUgMy41My0xLjI1bDEuMjUtMS43NWMuNTguMyAxLjM3LjUgMi4yOC41eiIgZmlsbD0iI2ZmNDBmZiIvPjwvc3ZnPg==', // From HomePage.vue
    passes: [ // From cart.spec.js
        { id: 'fn-battle', title: 'Battle Pass', price: '$7.99', type: 'standard', features: ["+ Cosmetic Set", "+ V-Bucks"] },
    ],
    gameSpecificFeature: "+ Glider Skin", // From cart.spec.js
    gameSpecificDiscount: "5% off V-Bucks purchases" // From cart.spec.js
  },
  {
    name: 'Call of Duty',
    value: 'cod',
    logoSrc: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxOCIgaGVpZ2h0PSIxOCIgdmlld0JveD0iMCAwIDI0IDI0Ij48cGF0aCBmaWxsPSIjNjg3MDY4IiBkPSJNMCAwaDI0djI0SDB6IiBmaWxsLW9wYWNpdHk9IjAuMSIvPjxwYXRoIGQ9Ik0xMiAyQzYuNDggMiAyIDYuNDggMiAxMnM0LjQ4IDEwIDEwIDEwIDEwLTQuNDggMTAtMTBTNzcuNTIgMiAxMiAyek0xMiA0Yy0xLjEgMC0yIC45LTIgMnY5aDEuNVYxMS41aDF2NC41aDEuNVY2aC0xVjQuNWgtMVYzYy0xLjV2MXptLTQuNSA1aDEuNVYxNmgtMS41Vjl6bTkgMGgxLjVWMTZIMTYuNVY5eiIgZmlsbD0iI2NjNzcwMCIvPjwvc3ZnPg==', // From HomePage.vue
    passes: [ // From cart.spec.js
        { id: 'cod-blackcell', title: 'BlackCell Pass', price: '$29.99', type: 'premium', features: ["+ Battle Pass", "+ Tier Skips", "+ COD Points"] },
    ],
    gameSpecificFeature: "+ Operator Skin", // From cart.spec.js
    gameSpecificDiscount: "Exclusive weapon blueprint" // From cart.spec.js
  }
];
