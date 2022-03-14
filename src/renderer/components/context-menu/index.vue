<template>
  <div
    ref="contextMenu"
    @click.stop
    @contextmenu.stop
    :id="id"
    :style="ctxStyle"
    class="ctx-menu-container"
  >
    <div style="background-color:transparent" class="ctx open">
      <ul
        role="menu"
        class="ctx-menu"
        :class="{
          'ctx-menu-right': align === 'right',
          'ctx-menu-left': align === 'left',
        }"
      >
        <slot></slot>
      </ul>
    </div>
  </div>
</template>

<script src="./ctx-menu.js"></script>

<style scoped lang="scss">
.ctx {
  position: relative;
}

.ctx-menu {
  position: absolute;
  top: 100%;
  left: 0;
  z-index: 1000;
  display: none;
  float: left;
  padding: 5px 0;
  margin: 2px 0 0;
  font-size: 0.9rem;
  color: #373a3c;
  text-align: left;
  list-style: none;
  background-color: #fff;
  -webkit-background-clip: padding-box;
  background-clip: padding-box;
  border: 1px solid rgba(0, 0, 0, 0.15);
  border-radius: 0.25rem;
  -moz-box-shadow: 0 0 2px #ccc;
  -webkit-box-shadow: 0 0 5px #ccc;
  box-shadow: 0 0 5px #ccc;
  border-top-left-radius: 0;
}

.ctx-divider {
  height: 1px;
  margin: 0.5rem 0;
  overflow: hidden;
  background-color: #e5e5e5;
}

.ctx-item {
  display: block;
  /*width: 100%;*/
  padding: 3px 20px;
  clear: both;
  font-weight: normal;
  line-height: 1.5;
  color: #373a3c;
  text-align: inherit;
  white-space: nowrap;
  background: none;
  border: 0;
  cursor: default;
}

.ctx-item:focus,
.ctx-item:hover {
  color: #2b2d2f;
  text-decoration: none;
  background-color: #f5f5f5;
  cursor: normal;
}

.ctx-item.active,
.ctx-item.active:focus,
.ctx-item.active:hover {
  color: #fff;
  text-decoration: none;
  background-color: #0275d8;
  outline: 0;
}

.ctx-item.disabled,
.ctx-item.disabled:focus,
.ctx-item.disabled:hover {
  color: #818a91;
}

.ctx-item.disabled:focus,
.ctx-item.disabled:hover {
  text-decoration: none;
  cursor: not-allowed;
  background-color: transparent;
  background-image: none;
  filter: 'progid:DXImageTransform.Microsoft.gradient(enabled = false)';
}

.open > .ctx-menu {
  display: block;
}

.open > a {
  outline: 0;
}

.ctx-menu-right {
  right: 0;
  left: auto;
}

.ctx-menu-left {
  right: auto;
  left: 0;
}

.ctx-header {
  display: block;
  padding: 3px 20px;
  font-size: 0.9rem;
  line-height: 1.5;
  color: #818a91;
  white-space: nowrap;
}

.ctx-backdrop {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 990;
}

.pull-right > .ctx-menu {
  right: 0;
  left: auto;
}

.ctx-menu-container {
  position: fixed;
  padding: 0;
  /* border: 1px solid #bbb; */
  background-color: whitesmoke;
  z-index: 99999;
  box-shadow: 0 5px 11px 0 rgba(0, 0, 0, 0.18), 0 4px 15px 0 rgba(0, 0, 0, 0.15);
}
</style>
