export function calculateElo(
   ra: number,
   rb: number,
   sa: number,
   sb: number,
   k: number = 32,
) {
   const ea = 1 / (1 + Math.pow(10, (rb - ra) / 400));
   const eb = 1 / (1 + Math.pow(10, (ra - rb) / 400));

   const newRa = Math.round(ra + k * (sa - ea));
   const newRb = Math.round(rb + k * (sb - eb));

   return { newRa, newRb };
}
