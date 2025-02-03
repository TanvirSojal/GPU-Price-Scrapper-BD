const NVIDIA = ["nvidia", "geforce", "rtx", "gtx", "gt", "quadro", "titan", "tesla", "nvs", "grid", "shield"];
const AMD = ["amd", "radeon", "rx", "pro", "fire"];
const INTEL = ["intel", "arc", "battleimage"];

const isNvidia = (name) => NVIDIA.some(brand => name.includes(brand));
const isAmd = (name) => AMD.some(brand => name.includes(brand));
const isIntel = (name) => INTEL.some(brand => name.includes(brand));

const getBrand = (name) => {
  if (typeof name !== "string") {
    return "-";
  }

  name = name.toLowerCase();

  if (isNvidia(name)) {
    return "Nvidia";
  }

  if (isAmd(name)) {
    return "AMD";
  }

  if (isIntel(name)) {
    return "Intel";
  }

  return "-";
}

module.exports = {
  getBrand
}