declare module 'network' {
  function get_private_ip(callback: (err: Error, ip: string) => void): void;
}
