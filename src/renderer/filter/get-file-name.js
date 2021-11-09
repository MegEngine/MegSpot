import { DELIMITER } from '@/constants';
export default function(path, flag = true) {
  if (!path) {
    return '';
  }
  let fileName = path.split(DELIMITER)[path.split(DELIMITER).length - 1];
  /***
   * 由于文件名过长，而文件名后半部分更为关注，所以左侧省略。通过direction:rtl。但是由于换位算法有问题导致文件名称异常 需要增加额外转义符号
   * 将第一特殊字符 _ 后面增加&lrm;转义符号
   * 参考文献： https://www.w3.org/TR/WCAG20-TECHS/H34.html
   *   */
  if (flag) fileName = fileName.replace(/([-_])/, '&lrm;$1');
  return fileName;
}
