
--- 验证spi flash驱动接口 目前该驱动兼容w25q32 bh25q32
require"spiFlash"
require "pm"
pm.wake("testSpiFlash")

local flashlist = {
    [0xEF15] = 'w25q32',
    [0xEF16] = 'w25q64',
    [0xEF17] = 'w25q128',
    [0x6815] = 'bh25q32',
}

sys.taskInit(function()
    local spi_flash = spiFlash.setup(spi.SPI_1)
    while true do
        local manufactureID, deviceID = spi_flash:readFlashID()
        print('spi flash id', manufactureID, deviceID)
        local flashName = (manufactureID and deviceID) and flashlist[manufactureID*256 + deviceID]
        log.info('testSPIFlash', 'flash name', flashName or 'unknown')
        print('spi flash erase 4K', spi_flash:erase4K(0x1000))
        print('spi flash write', spi_flash:write(0x1000, '123456'))
        print('spi flash read', spi_flash:read(0x1000, 6)) -- '123456'
        sys.wait(1000)
    end
end)
