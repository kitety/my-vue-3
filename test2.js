const effect = () => {
};
let set = new Set([effect]);
set.forEach(item => {
    set.delete(item)
    set.add(item)
})
