export function isElementInViewport(el: HTMLElement): boolean {
    const rect = el.getBoundingClientRect();

    return  (rect.left <= window.innerWidth && rect.right >= 0) &&
            (rect.top <= window.innerHeight && rect.bottom >= 0);
}
